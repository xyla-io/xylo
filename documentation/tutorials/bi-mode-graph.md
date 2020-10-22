After you have imported `xyla` library into your report (see {@tutorial importing-xyla}), you are ready to start building a graph using some query results!

### **Adding a `<div>` to contain the graph**
To show a graph in the report, we will first need an HTML `<div>` element. We will give the `div` an `id` with the value `"example-graph"` for this example, but the `id` can be any string you like.
```
<div id="example-graph"></div>
```

We will add the `div` element to the report builder HTML in the place we want the graph to be displayed. A good location is often after the `div` that contains the `{{ title }}` and `{{ description }}` of the report, as shown below:

```
<div class="mode-header embed-hidden">
  <h1>{{ title }}</h1>
  <p>{{ description }}</p>
</div>

<!-- Xyla graph div: -->
<div id="example-graph"></div>

<div class="mode-grid container">
```
